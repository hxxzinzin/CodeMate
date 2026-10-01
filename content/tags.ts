/**
 * 문제 태그 목록 (단일 출처).
 * tag_type은 Skill 카테고리와 1:1로 대응한다. 키는 kebab-case, 값은 화면 표시 이름.
 * 문제 검증 스크립트가 이 목록에 없는 태그를 거부한다.
 */
export const TAGS = {
  algorithm: {
    "brute-force": "Brute Force",
    simulation: "Simulation",
    sorting: "Sorting",
    "binary-search": "Binary Search",
    "prefix-sum": "Prefix Sum",
    "two-pointer": "Two Pointer",
    "sliding-window": "Sliding Window",
    greedy: "Greedy",
    recursion: "Recursion",
    backtracking: "Backtracking",
    dp: "DP",
    dfs: "DFS",
    bfs: "BFS",
    "shortest-path": "Shortest Path",
    dijkstra: "Dijkstra",
    "topological-sort": "Topological Sort",
    "union-find": "Union Find",
    "frequency-count": "Frequency Count",
    "string-algorithm": "String Algorithm",
  },
  data_structure: {
    array: "Array",
    string: "String",
    stack: "Stack",
    queue: "Queue",
    deque: "Deque",
    hashmap: "HashMap",
    hashset: "HashSet",
    "linked-list": "Linked List",
    heap: "Heap",
    "priority-queue": "Priority Queue",
    tree: "Tree",
    graph: "Graph",
  },
  java: {
    "basic-syntax": "Basic Syntax",
    oop: "OOP",
    collection: "Collection",
    generic: "Generic",
    comparator: "Comparator",
    exception: "Exception",
    lambda: "Lambda",
    stream: "Stream",
    "string-builder": "StringBuilder",
  },
  c: {
    "basic-syntax": "Basic Syntax",
    array: "Array",
    string: "String",
    pointer: "Pointer",
    function: "Function",
    struct: "Struct",
    "dynamic-memory": "Dynamic Memory",
    recursion: "Recursion",
  },
} as const;

export type TagType = keyof typeof TAGS;
export type TagKey<T extends TagType> = keyof (typeof TAGS)[T];
