import React from "react";

const SearchArea = () => {
  return (
    <div className="h-8 w-72 rounded-full border border-black/10">
      <input
        type="text"
        placeholder="Search for products"
        className="h-full px-2 pl-4 text-sm"
      />
    </div>
  );
};

export default SearchArea;
