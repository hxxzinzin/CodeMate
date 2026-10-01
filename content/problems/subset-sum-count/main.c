#include <stdio.h>

#define MAX_N 20

int n, target;
int values[MAX_N];
int count = 0;

/* index번째 원소부터 고를지 말지 결정한다. sum은 지금까지 고른 원소의 합 */
void dfs(int index, int sum) {
    if (index == n) {
        if (sum == target) count++;
        return;
    }
    dfs(index + 1, sum + values[index]); /* 고른다 */
    dfs(index + 1, sum);                 /* 고르지 않는다 */
}

int main(void) {
    if (scanf("%d %d", &n, &target) != 2) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &values[i]);
    }

    dfs(0, 0);
    if (target == 0) {
        count--; /* 아무것도 고르지 않은 경우(공집합)는 제외 */
    }
    printf("%d\n", count);
    return 0;
}
