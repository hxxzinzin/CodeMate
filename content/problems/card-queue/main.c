#include <stdio.h>

#define MAX_N 100000

/* 처음 N번 넣고 이후 최대 N - 1번 더 넣으므로 2N칸이면 충분하다. */
int queue[2 * MAX_N];
int head = 0;
int tail = 0;

void push(int x) {
    queue[tail++] = x;
}

int pop(void) {
    return queue[head++];
}

int size(void) {
    return tail - head;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    for (int i = 1; i <= n; i++) {
        push(i);
    }

    while (size() > 1) {
        printf("%d ", pop());  /* 맨 위 카드를 버린다 */
        push(pop());           /* 다음 카드를 맨 아래로 옮긴다 */
    }
    printf("%d\n", pop());
    return 0;
}
