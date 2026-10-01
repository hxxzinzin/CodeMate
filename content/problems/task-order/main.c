#include <stdio.h>

#define MAX_N 32000
#define MAX_M 100000

/* 인접 리스트: head[u]에서 시작해 next[]를 따라가며 to[]를 읽는다 */
int head[MAX_N + 1];
int next_edge[MAX_M];
int to[MAX_M];
int indegree[MAX_N + 1];

/* 최소 힙 */
int heap[MAX_N + 1];
int heap_size = 0;

int order[MAX_N];

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

void heap_push(int value) {
    int i = heap_size++;
    heap[i] = value;
    while (i > 0) { /* sift-up: 부모보다 작으면 올린다 */
        int parent = (i - 1) / 2;
        if (heap[parent] <= heap[i]) break;
        swap(&heap[parent], &heap[i]);
        i = parent;
    }
}

int heap_pop(void) {
    int top = heap[0];
    heap[0] = heap[--heap_size];
    int i = 0;
    for (;;) { /* sift-down: 더 작은 자식과 비교하며 내린다 */
        int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
        if (left < heap_size && heap[left] < heap[smallest]) smallest = left;
        if (right < heap_size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;
        swap(&heap[smallest], &heap[i]);
        i = smallest;
    }
    return top;
}

int main(void) {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;

    for (int i = 1; i <= n; i++) head[i] = -1;
    for (int e = 0; e < m; e++) {
        int a, b;
        scanf("%d %d", &a, &b);
        to[e] = b; /* a를 끝내야 b를 시작할 수 있다 */
        next_edge[e] = head[a];
        head[a] = e;
        indegree[b]++;
    }

    for (int i = 1; i <= n; i++) {
        if (indegree[i] == 0) heap_push(i);
    }

    int processed = 0;
    while (heap_size > 0) {
        int u = heap_pop();
        order[processed++] = u;
        for (int e = head[u]; e != -1; e = next_edge[e]) {
            if (--indegree[to[e]] == 0) heap_push(to[e]);
        }
    }

    if (processed < n) { /* 처리하지 못한 작업이 남았다면 순환이 있다 */
        printf("-1\n");
        return 0;
    }
    for (int i = 0; i < n; i++) {
        printf("%d%c", order[i], i + 1 < n ? ' ' : '\n');
    }
    return 0;
}
