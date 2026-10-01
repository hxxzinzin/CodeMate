#include <stdio.h>

#define MAX_LEN 100000

char s[MAX_LEN + 1];

int main(void) {
    if (scanf("%100000s", s) != 1) return 0;

    int count[26] = {0};
    for (int i = 0; s[i] != '\0'; i++) {
        count[s[i] - 'a']++;
    }

    for (int i = 0; s[i] != '\0'; i++) {
        if (count[s[i] - 'a'] == 1) {
            printf("%c\n", s[i]);
            return 0;
        }
    }
    printf("-1\n");
    return 0;
}
