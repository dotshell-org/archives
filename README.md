# Dotshell Archives

This repository is a TypeScript API that provides a RESTful API to access Dotshell public archives. 

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | List all archives |
| `GET /:id` | Specific archive content |
| `GET /file/*` | Download a file |

## Archives structure

Each folder in `data/` is an archive:
```
data/
└── my-archive/
    ├── README.md
    ├── screenshots/
    │   └── scr1.png
    └── files/
        └── doc.pdf
```
