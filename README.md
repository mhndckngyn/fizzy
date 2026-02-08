# fizzy

## Cách chạy

### Cài đặt
- [Bun](https://bun.com/)

### Setup thư mục gốc
(Ở folder root t cài thư viện để tự động format code khi commit)

```sh
bun install
```

### Setup Auth server
```sh
cd auth-server
bun install

# Trước khi chạy lần đầu
bunx prisma db pull
bunx prisma generate

# Run
bun dev
```
- Nếu chạy `bunx prisma db push` thì để ý tránh để nó xóa data nha

### Setup Web app
```sh
cd web-app
bun install

# Run
bun dev
```

### Setup Mobile app
```sh
cd mobile-app
bun install

# Run
bun dev
```
