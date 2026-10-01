#include <stdio.h>

#define MAX_N 100000

int profit[MAX_N + 1]; /* 1일부터 사용 */

int main(void) {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;
    for (int i = 1; i <= n; i++) {
        scanf("%d", &profit[i]);
    }

    /* 첫 K일의 합으로 시작 */
    long long sum = 0;
    for (int i = 1; i <= k; i++) {
        sum += profit[i];
    }
    long long best = sum;
    int best_day = 1;

    /* 구간을 한 칸씩 오른쪽으로 민다: i일이 들어오고 i-K일이 빠진다 */
    for (int i = k + 1; i <= n; i++) {
        sum += profit[i] - profit[i - k];
        if (sum > best) { /* 동점이면 먼저 시작한 구간을 유지 */
            best = sum;
            best_day = i - k + 1;
        }
    }

    printf("%lld %d\n", best, best_day);
    return 0;
}
