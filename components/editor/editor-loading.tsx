/**
 * 에디터 로딩 표시.
 * code-editor.tsx(Monaco 포함)와 분리해 두어야, 이 파일을 import해도 Monaco가 번들에 딸려오지 않는다.
 */
export function EditorLoading() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground" role="status">
      에디터를 불러오는 중…
    </div>
  );
}
