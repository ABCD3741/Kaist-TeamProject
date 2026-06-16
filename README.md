# 학교생활 건의함

학생이 학교생활에서 느낀 불편사항을 건의하고, 등록된 건의사항을 조회/관리할 수 있는 웹 서비스입니다.

## 주요 기능

- 건의사항 목록 조회
- 카테고리별 필터
- 최신순/공감순 정렬
- 건의사항 등록
- 건의사항 상세 조회
- 건의사항 수정 및 삭제
- 글 비밀번호 또는 마스터 비밀번호 기반 수정/삭제 보호
- 처리 상태 변경
- 공감 토글

## 실행 방법

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

개발 중 자동 재시작을 사용하려면:

```bash
npm run dev
```

## 프로젝트 구조

```text
data/
  seed.json
public/
  index.html
  styles.css
  app.js
src/
  db/
  middleware/
  repositories/
  routes/
  utils/
  app.js
  server.js
```

## API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/categories` | 카테고리 목록 조회 |
| GET | `/api/suggestions` | 건의사항 목록 조회 |
| GET | `/api/suggestions/:id` | 건의사항 상세 조회 |
| POST | `/api/suggestions` | 건의사항 등록 |
| PATCH | `/api/suggestions/:id` | 건의사항 수정 및 상태 변경 |
| DELETE | `/api/suggestions/:id` | 건의사항 삭제 |
| POST | `/api/suggestions/:id/likes` | 공감 등록/취소 토글 |

건의사항 등록 시 `password`를 함께 저장합니다. 수정/삭제/상태 변경 시에는 작성 때 만든 `password` 또는 관리용 `master_password` 둘 중 하나가 맞으면 됩니다. 수정 화면의 새 비밀번호 칸에 값을 입력하면 글 비밀번호가 변경됩니다. 기본 마스터 비밀번호는 `1234`이며, `MASTER_PASSWORD` 환경변수로 바꿀 수 있습니다. 기존 샘플 데이터처럼 글 비밀번호가 없는 글은 임시 글 비밀번호 `1234`로 관리할 수 있습니다.
