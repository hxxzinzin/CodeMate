#include <stdio.h>

#define MAX 50

int n, m;
char map[MAX][MAX + 2];
int visited[MAX][MAX];

const int DR[4] = {-1, 1, 0, 0};
const int DC[4] = {0, 0, -1, 1};

/* (r, c)와 상하좌우로 이어진 땅을 모두 방문 표시한다. */
void dfs(int r, int c) {
    visited[r][c] = 1;
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (map[nr][nc] == '1' && !visited[nr][nc]) dfs(nr, nc);
    }
}

int main(void) {
    if (scanf("%d %d", &n, &m) != 2) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%51s", map[i]);
    }

    int count = 0;
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < m; c++) {
            if (map[r][c] == '1' && !visited[r][c]) {
                count++;
                dfs(r, c);
            }
        }
    }

    printf("%d\n", count);
    return 0;
}
