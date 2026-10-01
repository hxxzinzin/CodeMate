#include <stdio.h>
#include <stdlib.h>

struct Node {
    int value;
    struct Node *next;
};

/* 값 하나를 담은 새 노드를 만든다. */
struct Node *create_node(int value) {
    struct Node *node = malloc(sizeof(struct Node));
    if (node == NULL) {
        fprintf(stderr, "메모리 할당 실패\n");
        exit(1);
    }
    node->value = value;
    node->next = NULL;
    return node;
}

/* 포인터 방향만 바꿔서 리스트를 뒤집고 새 head를 돌려준다. */
struct Node *reverse(struct Node *head) {
    struct Node *prev = NULL;
    struct Node *cur = head;
    while (cur != NULL) {
        struct Node *next = cur->next; /* 1. 다음 노드 기억 */
        cur->next = prev;              /* 2. 방향 뒤집기 */
        prev = cur;                    /* 3. 한 칸 전진 */
        cur = next;
    }
    return prev;
}

/* 모든 노드를 해제한다. 해제하기 전에 다음 노드 주소를 저장한다. */
void free_list(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    struct Node *head = NULL;
    struct Node *tail = NULL;
    for (int i = 0; i < n; i++) {
        int value;
        scanf("%d", &value);
        struct Node *node = create_node(value);
        if (head == NULL) {
            head = node;
        } else {
            tail->next = node;
        }
        tail = node;
    }

    head = reverse(head);

    for (struct Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d%c", cur->value, cur->next != NULL ? ' ' : '\n');
    }

    free_list(head);
    return 0;
}
