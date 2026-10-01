export const THEME_STORAGE_KEY = "codemate:theme";

/**
 * <head>에서 첫 렌더 전에 실행되는 스크립트.
 * 저장된 테마가 없으면 OS 설정을 따른다. (테마 깜빡임 방지)
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
