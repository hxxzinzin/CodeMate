"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

type Props = {
  initialJavaRatio: number;
};

/** Java/C 출제 비율 설정. 저장은 로그인·DB 연동 이후 구현한다. */
export function LanguageRatioForm({ initialJavaRatio }: Props) {
  const [javaRatio, setJavaRatio] = useState(initialJavaRatio);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span>Java {javaRatio}%</span>
        <span>C {100 - javaRatio}%</span>
      </div>
      <Slider
        value={[javaRatio]}
        onValueChange={([value]) => setJavaRatio(value)}
        min={0}
        max={100}
        step={10}
        thumbLabel="Java 출제 비율"
      />
      <p className="text-xs text-muted-foreground">
        오늘의 문제를 고를 때 이 비율에 맞춰 언어를 정합니다. 설정 저장은 로그인 기능과 함께 제공됩니다.
      </p>
    </div>
  );
}
