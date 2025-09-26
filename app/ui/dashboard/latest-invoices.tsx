import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices } from '@/app/lib/data';

// Função para gerar cor do avatar
function getAvatarColor(name: string) {
  const colors = [
    'bg-red-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-purple-400',
    'bg-pink-400',
  ];
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) charCodeSum += name.charCodeAt(i);
  return colors[charCodeSum % colors.length];
}

// Agora é um componente async que procura os próprios dados
export default async function LatestInvoices() {
  const latestInvoices = await fetchLatestInvoices();

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Clients
      </h2>

      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestInvoices.map((client, i) => (
            <div
              key={client.id}
              className={clsx(
                'flex flex-row items-center justify-between py-4',
                { 'border-t': i !== 0 }
              )}
            >
              <div className="flex items-center">
                {/* Avatar colorido com inicial */}
                <div
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-white font-semibold',
                    getAvatarColor(client.name)
                  )}
                >
                  {client.name.charAt(0).toUpperCase()}
                </div>

                <div className="ml-4 min-w-0">
                  <p className="truncate text-sm font-semibold md:text-base">
                    {client.name}
                  </p>
                  {client.email && (
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {client.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
