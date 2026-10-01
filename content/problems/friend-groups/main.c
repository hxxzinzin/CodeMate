#include <stdio.h>

#define MAX_N 500000

int parent[MAX_N + 1];
int size[MAX_N + 1];
int groups;

/* 루트를 찾고, 지나온 노드들이 루트를 직접 가리키게 한다 (경로 압축). */
int find(int x) {
    int root = x;
    while (parent[root] != root) root = parent[root];
    while (x != root) {
        int next = parent[x];
        parent[x] = root;
        x = next;
    }
    return root;
}

/* 서로 다른 그룹이면 작은 트리를 큰 트리 밑에 붙이고 그룹 수를 줄인다. */
void unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return;
    if (size[ra] < size[rb]) {
        int t = ra;
        ra = rb;
        rb = t;
    }
    parent[rb] = ra;
    size[ra] += size[rb];
    groups--;
}

int main(void) {
    int n, q;
    if (scanf("%d %d", &n, &q) != 2) return 0;

    for (int i = 1; i <= n; i++) {
        parent[i] = i;
        size[i] = 1;
    }
    groups = n;

    for (int i = 0; i < q; i++) {
        int type, a, b;
        scanf("%d %d %d", &type, &a, &b);
        if (type == 1) {
            unite(a, b);
        } else {
            puts(find(a) == find(b) ? "YES" : "NO");
        }
    }
    printf("%d\n", groups);
    return 0;
}
