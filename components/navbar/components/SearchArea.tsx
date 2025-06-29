import React from "react";

const SearchArea = () => {
  return (
    <div className="w-72 h-8 border border-black/10 rounded-full">
      <input
        type="text"
        placeholder="Search for products"
        className="h-full px-2 pl-4 text-sm"
      />
    </div>
  );
};

export default SearchArea;
