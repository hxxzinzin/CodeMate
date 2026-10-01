#include <stdio.h>

#define MOD 1000000007LL

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    if (n == 1) {
        printf("1\n");
        return 0;
    }

    /* ways[i] = ways[i-1] + ways[i-2]. 직전 두 값만 변수로 유지한다. */
    long long prev2 = 1; /* ways[1] */
    long long prev1 = 2; /* ways[2] */
    for (int i = 3; i <= n; i++) {
        long long cur = (prev1 + prev2) % MOD;
        prev2 = prev1;
        prev1 = cur;
    }

    printf("%lld\n", prev1);
    return 0;
}
