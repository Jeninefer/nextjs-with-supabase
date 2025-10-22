"use client";

import { useId } from "react";
import { Checkbox } from "../ui/checkbox";

export function TutorialStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = useId();
  
  return (
    <li className="relative">
      <Checkbox
        id={id}
        name={id}
        className={`absolute top-[3px] mr-2 peer`}
      />
      <label
        htmlFor={id}
        className={`relative text-base text-foreground peer-checked:line-through font-medium`}
      >
        <span className="ml-8">{title}</span>
        <div
          className={`ml-8 text-sm peer-checked:line-through font-normal text-muted-foreground`}
        >
          {children}
        </div>
      </label>
    </li>
  );
}
