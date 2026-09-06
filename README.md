# Aidonia
Aidonia là frontend marketplace được xây dựng với Next.js App Router. Ứng dụng hỗ trợ duyệt và tìm kiếm sản phẩm, giỏ hàng, wishlist, tạo bài đăng, thanh toán, tài khoản người dùng, chat realtime và khu vực quản trị.

## Tính năng chính
- Storefront: trang chủ, danh mục, shop, chi tiết sản phẩm, tìm kiếm và quick view.
- Tài khoản: đăng ký, đăng nhập, xác thực email, quản lý thông tin cá nhân và đơn hàng.
- Commerce: giỏ hàng, wishlist, checkout, mua package và theo dõi trạng thái thanh toán.
- Nội dung: tạo bài đăng với ảnh tải lên Firebase Storage.
- Chat realtime: nhắn tin và trạng thái typing qua SignalR.
- Admin dashboard: quản lý users, categories, packages, duyệt bài đăng, reports, analytics và settings.

## Công nghệ
- Next.js `15.5.2`, React `19.1.0`, TypeScript `5`.
- Tailwind CSS, Preline, Swiper và các component UI nội bộ.
- Redux Toolkit, React Redux và Zustand cho state management.
- Axios cho REST API; tự động gửi Bearer token và refresh token khi nhận `401`.
- Firebase Auth, Firestore và Storage.
- Microsoft SignalR cho chat realtime.
- Recharts, ApexCharts và jsVectorMap cho dashboard.

## Yêu cầu
- Node.js 20 trở lên.
- npm và một backend Aidonia đang chạy.
- Một Firebase project đã bật Authentication, Firestore và Storage.

## Cài đặt local
```bash
git clone <repository-url>
cd aidonia
npm ci
# Tạo .env.local theo phần "Biến môi trường" bên dưới
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Tạo `.env.local` theo bảng bên dưới trước khi chạy ứng dụng.

## Biến môi trường
Các biến `NEXT_PUBLIC_*` được dùng ở phía client, vì vậy không đặt secret backend vào các biến này.

```env
# REST API base URL. Thường kết thúc bằng /api để gọi các endpoint REST.
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/

# Firebase Web App configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Bật mock/fallback ở các màn hình có hỗ trợ mock
NEXT_PUBLIC_USE_MOCK=false
```

`NEXT_PUBLIC_API_BASE_URL` được dùng cho Axios. SignalR tự loại bỏ hậu tố `/api` rồi kết nối tới `${API_BASE_URL}/chathub`, vì vậy backend cần expose hub tại route `/chathub` ở root.

## Scripts
| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy development server với Turbopack |
| `npm run dev:debug` | Chạy development server với Node inspector |
| `npm run build` | Build production với Turbopack |
| `npm run start` | Chạy bản build production |
| `npm run lint` | Chạy ESLint |
| `npm run build:analyze` | Build với cờ phân tích bundle |
| `npm run perf:lighthouse` | Đo Lighthouse tại `http://localhost:3000` |
| `npm run perf:bundle` | Alias cho bundle analysis |

## Route chính
### Storefront

| Route | Chức năng |
| --- | --- |
| `/` | Trang chủ |
| `/shop-with-sidebar` | Danh sách sản phẩm có sidebar |
| `/shop-without-sidebar` | Danh sách sản phẩm không sidebar |
| `/shop-details` | Chi tiết sản phẩm |
| `/wishlist` | Sản phẩm yêu thích |
| `/checkout` | Thanh toán |
| `/chat` | Chat |
| `/create-post` | Tạo bài đăng |
| `/my-account` | Tài khoản người dùng |

### Authentication và admin
| Route | Chức năng |
| --- | --- |
| `/signin`, `/signup` | Đăng nhập và đăng ký |
| `/verify-email`, `/email-verified` | Xác minh email |
| `/admin` | Dashboard quản trị |
| `/admin/users` | Quản lý users |
| `/admin/categories` | Quản lý categories |
| `/admin/packages` | Quản lý packages |
| `/admin/post-approval` | Duyệt bài đăng |
| `/admin/reports`, `/admin/analytics` | Báo cáo và phân tích |

Middleware bảo vệ toàn bộ `/admin`, `/create-post` và `/my-account`. Token có thể được đọc từ cookie `token` hoặc Authorization header; role `admin` được yêu cầu cho khu vực admin.

## Cấu trúc source
```text
src/
├── app/          # App Router, storefront và admin pages
├── components/   # UI theo domain: Auth, Shop, Cart, Chat, Admin...
├── hooks/        # Custom hooks cho auth, upload và redirect
├── redux/        # Redux provider, store và features
├── services/     # Axios API, Firebase, SignalR và domain services
├── types/        # TypeScript types dùng chung
└── utils/        # Auth, cache, currency, image và toast helpers
```

Alias `@/*` trỏ tới `src/*`.

## Docker

Dockerfile sử dụng Node 20 Alpine, build output dạng Next.js standalone và chạy bằng user non-root:

```bash
docker build -t aidonia-frontend .
docker run --rm -p 3000:3000 \
	--env-file .env.local \
	aidonia-frontend
```

Với Next.js, các biến `NEXT_PUBLIC_*` cần có trong lúc `docker build` nếu giá trị được nhúng vào client bundle. Khi deploy, cần bảo đảm backend cho phép CORS và credentials từ domain frontend.

## Kiểm tra trước khi gửi thay đổi

```bash
npm run lint
npm run build
```

Các script kiểm tra bổ sung nằm trong thư mục `scripts/`, gồm audit security cho admin pages, kiểm tra auth endpoint, kiểm tra chart và audit performance.

## Ghi chú backend

- REST API phải khớp với các service trong `src/services/` và hỗ trợ CORS.
- API cần chấp nhận Bearer token; frontend tự thử refresh token khi response là `401`.
- SignalR hub cần có tên `chathub` và hỗ trợ các thao tác conversation/message được gọi trong `src/services/signalr.ts`.
- Firebase Storage cần cho phép upload/read theo policy của project; không commit thông tin bí mật hoặc file `.env.local`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
