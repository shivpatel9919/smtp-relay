const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Relay-Token');
                  return res.status(204).end();
                    }
                      res.setHeader('Access-Control-Allow-Origin', '*');

                        if (req.method === 'GET') {
                            return res.json({ ok: true, message: 'SMTP relay ready. POST with X-Relay-Token to send.' });
                              }

                                if (req.method !== 'POST') {
                                    return res.status(405).json({ ok: false, error: 'Method not allowed' });
                                      }

                                        if (req.headers['x-relay-token'] !== process.env.RELAY_TOKEN) {
                                            return res.status(401).json({ ok: false, error: 'Invalid or missing X-Relay-Token' });
                                              }

                                                const { username, password, fromName, fromEmail, to, cc, bcc, subject, html, plain, attachments } = req.body || {};

                                                  if (!username || !password) return res.status(400).json({ ok: false, error: 'username and password required' });
                                                    if (!fromEmail) return res.status(400).json({ ok: false, error: 'fromEmail required' });
                                                      if (!to || !to.length) return res.status(400).json({ ok: false, error: 'at least one recipient (to) required' });
                                                        if (!subject) return res.status(400).json({ ok: false, error: 'subject required' });

                                                          try {
                                                              const transporter = nodemailer.createTransport({
                                                                    host: 'smtp.migadu.com',
                                                                          port: 465,
                                                                                secure: true,
                                                                                      auth: { user: username, pass: password },
                                                                                            connectionTimeout: 15000,
                                                                                                  socketTimeout: 25000,
                                                                                                      });
                                                                                                      
                                                                                                          const info = await transporter.sendMail({
                                                                                                                from: fromName ? `"${fromName.replace(/"/g, '\\"')}" <${fromEmail}>` : fromEmail,
                                                                                                                      to: Array.isArray(to) ? to.join(', ') : to,
                                                                                                                            cc: cc && cc.length ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
                                                                                                                                  bcc: bcc && bcc.length ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
                                                                                                                                        subject,
                                                                                                                                              text: plain || '',
                                                                                                                                                    html: html || undefined,
                                                                                                                                                          attachments: (attachments || []).map(a => ({
                                                                                                                                                                  filename: a.filename,
                                                                                                                                                                          content: a.content,
                                                                                                                                                                                  encoding: 'base64',
                                                                                                                                                                                          contentType: a.contentType || 'application/octet-stream',
                                                                                                                                                                                                })),
                                                                                                                                                                                                    });
                                                                                                                                                                                                    
                                                                                                                                                                                                        return res.json({ ok: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response });
                                                                                                                                                                                                          } catch (e) {
                                                                                                                                                                                                              return res.status(500).json({ ok: false, error: e.message, code: e.code, command: e.command });
                                                                                                                                                                                                                }
                                                                                                                                                                                                                };
