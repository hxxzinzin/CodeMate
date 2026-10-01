#include <stdio.h>
#include <string.h>

#define MAX 1000

char grid[MAX][MAX + 2];
int dist[MAX][MAX];
int queue[MAX * MAX];

const int DR[4] = {-1, 1, 0, 0};
const int DC[4] = {0, 0, -1, 1};

int main(void) {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%1001s", grid[i]);
    }

    memset(dist, -1, sizeof(dist));

    /* 칸 (r, c)를 r * m + c 하나의 정수로 저장하는 배열 큐 */
    int head = 0, tail = 0;
    dist[0][0] = 0;
    queue[tail++] = 0;

    while (head < tail) {
        int cur = queue[head++];
        int r = cur / m, c = cur % m;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1; /* 큐에 넣을 때 방문 표시 */
            queue[tail++] = nr * m + nc;
        }
    }

    printf("%d\n", dist[n - 1][m - 1]);
    return 0;
}
