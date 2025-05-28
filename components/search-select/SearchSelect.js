'use client';

import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

/* This component wraps the react select. What it is doing is simply adding a category
option to the react select, filteroption function returns the label if searched or the 
category associated with the skills*/

const filterOption = (option, inputValue) => {
  const search = inputValue.toLowerCase();
  return (
    option.label.toLowerCase().includes(search) ||
    option.data.category.toLowerCase().includes(search)
  );
};

export default function SearchSelect({ options, ...restProps }) {
  return (
    <Select
      options={options}
      filterOption={filterOption}
      isSearchable
      {...restProps}
    />
  );
}
