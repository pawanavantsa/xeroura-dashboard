#!/usr/bin/env bash
# Oracle free-tier Ubuntu. Run on the VM:
#   curl -fsSL https://raw.githubusercontent.com/pawanavantsa/xeroura-dashboard/main/deploy/setup.sh | sudo bash
# or, from this repo on the VM:
#   sudo bash deploy/setup.sh
set -euo pipefail

APP_DIR=/opt/xeroura-dashboard
WWW=/var/www/xdash
REPO=${REPO:-https://github.com/pawanavantsa/xeroura-dashboard.git}

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/setup.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git nginx curl ca-certificates rsync

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" reset --hard origin/main
fi

if [[ ! -f "$APP_DIR/.env" ]]; then
  echo "Missing $APP_DIR/.env"
  echo "Create it with:"
  echo "  VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co"
  echo "  VITE_SUPABASE_ANON_KEY=eyJ..."
  exit 1
fi

cd "$APP_DIR"
npm ci
npm run build

mkdir -p "$WWW"
rsync -a --delete "$APP_DIR/dist/" "$WWW/"
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/xdash
ln -sfn /etc/nginx/sites-available/xdash /etc/nginx/sites-enabled/xdash
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "Serving $WWW on :80"
ip -4 addr show scope global | awk '/inet /{print $2}' | cut -d/ -f1
