import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { options } from 'utils/auth/options';
import AuthProvider from 'components/auth/AuthProvider';
import InfoNotification from 'components/notifications/InfoNotification';
import AuthButtons from 'components/auth/AuthButtons';
import NavigationLinks from 'components/layout/NavigationLinks';

export default async function NavigationHeader() {
    const session = await getServerSession(options);

    return (
        <header>
            <div className="container max-w-screen-xl mx-auto px-5 flex justify-between items-center text-black max-sm:text-sm">
                <div className="flex gap-4 lg:gap-6 items-center">
                    <Link href="/">
                        <Image src="/icon-03.svg" height="80" width="80" alt="Connected KW" />
                    </Link>
                </div>
                <div className="flex gap-4 lg:gap-6 items-center">
                    <NavigationLinks />
                    <AuthProvider session={session}>
                        <AuthButtons />
                        <InfoNotification />
                    </AuthProvider>
                </div>
            </div>
        </header>
    );
}
