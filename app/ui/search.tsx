'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface SearchProps {
  placeholder?: string;
}

export default function Search({ placeholder = 'Procurar...' }: SearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState(searchParams?.get('query') || '');

  // Debounce para atualizar a URL
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) {
      params.set('query', value);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTerm(value);
    debouncedSearch(value);
  }

  return (
    <div className="relative w-full">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 p-2 border rounded"
      />
    </div>
  );
}
