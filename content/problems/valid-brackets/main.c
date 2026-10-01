#include <stdio.h>
#include <string.h>

#define MAX_LEN 100001

char s[MAX_LEN + 1];
char stack[MAX_LEN];

int matches(char open, char close) {
    return (open == '(' && close == ')')
        || (open == '{' && close == '}')
        || (open == '[' && close == ']');
}

int main(void) {
    if (scanf("%100001s", s) != 1) return 0;

    int top = 0;
    int ok = 1;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[top++] = c;
        } else if (top == 0 || !matches(stack[--top], c)) {
            ok = 0;
            break;
        }
    }
    if (top != 0) ok = 0;

    printf("%s\n", ok ? "YES" : "NO");
    return 0;
}
