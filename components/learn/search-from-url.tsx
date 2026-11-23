"use client";
import { useSearchParams } from "next/navigation";
import { SearchBox } from "./search-box";
export function SearchFromUrl() {
  const q = useSearchParams().get("q") || "";
  return <SearchBox key={q} initial={q} big autoFocus />;
}
