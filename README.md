# Xeroura work update

Client project portal — each organisation has its own project, board, and people.

Xeroura staff add the client and their login. Clients sign in and only see their work.

## Local

```bash
npm install
npm run dev
```

http://127.0.0.1:5174 — works against mock data until `.env` has Supabase keys.

## Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL editor → paste `supabase/schema.sql` → run.
3. Authentication → Providers → Email on. Turn **Confirm email** off for seeded logins. Disable public sign-ups.
4. `.env` from `.env.example` with Project URL + anon key.
5. Seed users and boards:

```bash
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... npm run seed
```

Seeded logins: `nisha@inq.edu` / `look-inq`, `priya@inq.edu` / `demo`, `arjun@xeroura.com` / `demo`.

## Oracle free VM

On the VM (Ubuntu):

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/pawanavantsa/xeroura-dashboard.git /opt/xeroura-dashboard
sudo tee /opt/xeroura-dashboard/.env >/dev/null <<'EOF'
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
EOF
sudo bash /opt/xeroura-dashboard/deploy/setup.sh
```

Open the VM public IP on port 80. Ingress: TCP 80 (and 22 for SSH) on the VCN security list.
