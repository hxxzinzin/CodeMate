#include <stdio.h>

#define MAX_N 100000

/* prefix[i] = 1일부터 i일까지의 합 (최대 10^11이므로 long long) */
long long prefix[MAX_N + 1];

int main(void) {
    int n, q;
    if (scanf("%d %d", &n, &q) != 2) return 0;

    prefix[0] = 0;
    for (int i = 1; i <= n; i++) {
        int value;
        scanf("%d", &value);
        prefix[i] = prefix[i - 1] + value;
    }

    for (int i = 0; i < q; i++) {
        int l, r;
        scanf("%d %d", &l, &r);
        printf("%lld\n", prefix[r] - prefix[l - 1]);
    }
    return 0;
}
