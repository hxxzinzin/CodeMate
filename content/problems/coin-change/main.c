#include <stdio.h>

#define MAX_N 100
#define MAX_K 100000

int coins[MAX_N];
int dp[MAX_K + 1];

int main(void) {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &coins[i]);
    }

    const int INF = k + 1; /* 동전 개수는 K를 넘을 수 없으므로 K + 1을 "만들 수 없음"으로 쓴다 */
    dp[0] = 0;
    for (int x = 1; x <= k; x++) {
        dp[x] = INF;
        for (int i = 0; i < n; i++) {
            int c = coins[i];
            if (c <= x && dp[x - c] + 1 < dp[x]) {
                dp[x] = dp[x - c] + 1;
            }
        }
    }

    printf("%d\n", dp[k] == INF ? -1 : dp[k]);
    return 0;
}
