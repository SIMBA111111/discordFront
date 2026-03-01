import { Header } from '@/widgets/header/ui/header';
import { cookies } from 'next/headers'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies()

  const cookie = cookieStore.get('userData')?.value

  let userData;
  try {
    userData = JSON.parse(cookie ?? '{}'); // используем пустой объект по умолчанию
  } catch (e) {
    console.error('Ошибка парсинга cookie:', e);
    userData = {}; // или задавайте дефолтные данные
  }

  return (
    <html lang="en">
      <body>
        <Header userData={userData}/>
        {children}
      </body>
    </html>
  );
}