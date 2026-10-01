#include <stdio.h>

#define MAX_N 500000

int heights[MAX_N];
int answer[MAX_N];
int stack[MAX_N]; /* 아직 답을 찾지 못한 건물의 인덱스 */

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &heights[i]);
        answer[i] = -1;
    }

    int top = 0;
    for (int i = 0; i < n; i++) {
        while (top > 0 && heights[stack[top - 1]] < heights[i]) {
            answer[stack[--top]] = heights[i];
        }
        stack[top++] = i;
    }

    for (int i = 0; i < n; i++) {
        printf(i == 0 ? "%d" : " %d", answer[i]);
    }
    printf("\n");
    return 0;
}
