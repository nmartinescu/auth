# Setup Linux (Ubuntu)

## Prerequisites

Verifică dacă ai deja instalate dependențele:

```bash
lsb_release -a
git --version
node -v
npm -v
docker --version
docker compose version
```

> Necesare:
- Ubuntu 20.04+
- Node.js v20+
- Docker + Docker Compose
- Git

---

## Update sistem

```bash
sudo apt update
```

---

## Node.js & npm (doar dacă NU există sau e sub v20)

```bash
node -v
```

Dacă versiunea este sub 20 sau lipsește:

```bash
sudo apt remove nodejs -y
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

Verificare:
```bash
node -v
npm -v
```

---

## Docker (doar dacă NU e instalat)

```bash
docker --version
```

Dacă nu există:

```bash
sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc | cut -f1)

sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verificare:
```bash
docker --version
docker compose version
```

---

## Git (doar dacă NU e instalat)

```bash
git --version || sudo apt install git -y
```

---

## Clonare proiect

```bash
git clone https://github.com/nmartinescu/auth.git
cd auth
```

---

## Frontend

```bash
cd frontend
npm install
```

---

## Backend

```bash
cd ../
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## Pornire frontend 

```bash
cd ./frontend
npm run dev
```
