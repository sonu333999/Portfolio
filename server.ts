import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Lightweight in-memory rate limiter for public validation endpoint
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_INQUIRY_TYPES = new Set([
  'Collaboration',
  'Internship / Role',
  'UI/UX & Frontend',
  'AI / ML Project',
  'General',
]);

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'sonu-khajotiya-portfolio',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/validate-inquiry', (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(clientIp, 15, 60_000)) {
      res.status(429).json({
        valid: false,
        error: 'Too many submissions in a short window. Please wait a minute and try again.',
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const senderName = typeof body?.senderName === 'string' ? body.senderName.trim() : '';
    const senderEmail = typeof body?.senderEmail === 'string' ? body.senderEmail.trim() : '';
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const inquiryType = typeof body?.inquiryType === 'string' ? body.inquiryType.trim() : '';

    if (senderName.length < 2 || senderName.length > 100) {
      res.status(400).json({ valid: false, error: 'Name must be between 2 and 100 characters.' });
      return;
    }
    if (!EMAIL_REGEX.test(senderEmail) || senderEmail.length > 140) {
      res.status(400).json({ valid: false, error: 'Please provide a valid email address.' });
      return;
    }
    if (!ALLOWED_INQUIRY_TYPES.has(inquiryType)) {
      res.status(400).json({ valid: false, error: 'Invalid inquiry category.' });
      return;
    }
    if (subject.length < 2 || subject.length > 160) {
      res.status(400).json({ valid: false, error: 'Subject must be between 2 and 160 characters.' });
      return;
    }
    if (message.length < 10 || message.length > 2500) {
      res.status(400).json({ valid: false, error: 'Message must be between 10 and 2500 characters.' });
      return;
    }

    res.json({
      valid: true,
      sanitized: {
        senderName,
        senderEmail,
        inquiryType,
        subject,
        message,
      },
    });
  });

  app.post('/api/resume/export', (req, res) => {
    const body = req.body as {
      profile?: Record<string, unknown>;
      projects?: Array<Record<string, unknown>>;
      achievements?: Array<Record<string, unknown>>;
      skills?: Array<Record<string, unknown>>;
    };

    const profile = body?.profile || {};
    const fullName = typeof profile.fullName === 'string' ? profile.fullName : 'Sonu Khajotiya';
    const headline = typeof profile.headline === 'string' ? profile.headline : '';
    const bio = typeof profile.bio === 'string' ? profile.bio : '';
    const email = typeof profile.email === 'string' ? profile.email : '';
    const location = typeof profile.location === 'string' ? profile.location : '';
    const phone = typeof profile.phone === 'string' ? profile.phone : '';
    const degree = typeof profile.degree === 'string' ? profile.degree : '';
    const institution = typeof profile.institution === 'string' ? profile.institution : '';
    const graduationPeriod = typeof profile.graduationPeriod === 'string' ? profile.graduationPeriod : '';
    const cgpa = typeof profile.cgpa === 'string' ? profile.cgpa : '';
    const cgpaVerified = Boolean(profile.cgpaVerified);

    const lines: string[] = [
      `# ${fullName}`,
      headline ? `**${headline}**` : '',
      '',
      [location, email, phone].filter(Boolean).join(' · '),
      '',
      '## Summary',
      bio,
      '',
      '## Education',
      `- **${degree}** — ${institution} (${graduationPeriod})`,
      cgpa ? `- CGPA: ${cgpa}${cgpaVerified ? ' (Verified)' : ' (Pending Verification)'}` : '',
      '',
    ];

    const skills = Array.isArray(body?.skills) ? body.skills : [];
    if (skills.length > 0) {
      lines.push('## Technical Capabilities');
      const grouped = new Map<string, string[]>();
      for (const s of skills) {
        const disc = typeof s.discipline === 'string' ? s.discipline : 'General';
        const name = typeof s.name === 'string' ? s.name : '';
        if (!name) continue;
        if (!grouped.has(disc)) grouped.set(disc, []);
        grouped.get(disc)!.push(name);
      }
      for (const [disc, names] of grouped.entries()) {
        lines.push(`- **${disc}:** ${names.join(', ')}`);
      }
      lines.push('');
    }

    const projects = Array.isArray(body?.projects) ? body.projects : [];
    if (projects.length > 0) {
      lines.push('## Selected Projects');
      for (const p of projects) {
        const title = typeof p.title === 'string' ? p.title : '';
        const cat = typeof p.category === 'string' ? p.category : '';
        const timeline = typeof p.timeline === 'string' ? p.timeline : '';
        const summary = typeof p.summary === 'string' ? p.summary : '';
        const stack = Array.isArray(p.techStack) ? p.techStack.join(', ') : '';
        lines.push(`### ${title}`);
        lines.push(`${[cat, timeline].filter(Boolean).join(' · ')}`);
        if (summary) lines.push(summary);
        if (stack) lines.push(`Stack: ${stack}`);
        lines.push('');
      }
    }

    const achievements = Array.isArray(body?.achievements) ? body.achievements : [];
    if (achievements.length > 0) {
      lines.push('## Achievements & Certifications');
      for (const a of achievements) {
        const title = typeof a.title === 'string' ? a.title : '';
        const issuer = typeof a.issuer === 'string' ? a.issuer : '';
        const dateLabel = typeof a.dateLabel === 'string' ? a.dateLabel : '';
        lines.push(`- **${title}** — ${issuer}${dateLabel ? ` (${dateLabel})` : ''}`);
      }
      lines.push('');
    }

    const markdown = lines.filter((line) => line !== undefined).join('\n');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Sonu_Khajotiya_CV.md"');
    res.send(markdown);
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output missing. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
