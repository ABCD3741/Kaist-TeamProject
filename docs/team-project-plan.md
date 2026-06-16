# 팀 프로젝트 설계 문서

## 1. 팀 정보
- 팀원: codex, 유건우
- 서비스 이름: 학교생활 건의함
- 한 줄 설명: 학생이 학교생활에서 느낀 불편사항을 쉽게 건의하고, 건의 내용을 모아 관리할 수 있는 서비스

## 2. 브레인스토밍

### 아이디어 1
- 사용자: 학생
- 상황: 학교 시설이나 급식, 수업 환경 등에서 불편함을 느낀 상황
- 액션: 학생이 불편사항을 건의글로 작성한다

### 아이디어 2
- 사용자: 학생
- 상황: 다른 학생들이 어떤 불편사항을 건의했는지 확인하고 싶은 상황
- 액션: 학생이 건의 목록을 조회한다

### 아이디어 3
- 사용자: 관리자 또는 선생님
- 상황: 학생들이 올린 건의사항을 확인하고 처리 상태를 바꾸는 상황
- 액션: 관리자가 건의사항의 처리 상태를 수정한다

## 3. 액션 아이템

### 액션 아이템 1
- 사용자 액션: 학생이 건의사항 제목, 내용, 카테고리를 입력하고 등록한다
- 서버가 해야 할 일: 입력받은 건의사항 데이터를 DB에 저장한다
- 저장할 데이터: 제목, 내용, 카테고리, 작성자 이름, 처리 상태, 작성 시간
- 후보 테이블: suggestions

### 액션 아이템 2
- 사용자 액션: 학생이 등록된 건의사항 목록을 확인한다
- 서버가 해야 할 일: DB에 저장된 건의사항 목록을 최신순으로 조회해서 보내준다
- 저장할 데이터: 따로 새로 저장하지 않음
- 후보 테이블: suggestions

### 액션 아이템 3
- 사용자 액션: 학생이 건의사항 작성 시 글 비밀번호를 설정한다
- 서버가 해야 할 일: 글 비밀번호를 해시로 저장하고, 수정/삭제 시 비밀번호를 확인한다
- 저장할 데이터: 비밀번호 해시
- 후보 테이블: suggestions

### 액션 아이템 4
- 사용자 액션: 학생이 건의사항에 공감 버튼을 누른다
- 서버가 해야 할 일: 같은 사용자가 다시 누르면 공감을 취소하고, 처음 누르면 공감을 저장한다
- 저장할 데이터: 건의사항 id, 사용자 이름, 공감 시간
- 후보 테이블: likes

## 4. DB 스키마

### 테이블 1
테이블명: suggestions  
설명: 학생이 작성한 건의사항을 저장한다.

컬럼:
- [id]: 정수(integer), PK, 자동 증가, not null
- [title]: 문자열(text), not null
- [content]: 문자열(text), not null
- [category_id]: 정수(integer), not null, FK -> categories(id)
- [writer_name]: 문자열(text), not null
- [password_hash]: 문자열(text), not null
- [status]: 문자열(text), not null, 기본값 '접수'
- [created_at]: 날짜/시간(datetime), not null, 기본값 현재 시간

관계:
- 이 테이블의 [category_id]는 categories 테이블의 [id]를 가리킨다.

### 테이블 2
테이블명: categories  
설명: 건의사항의 분류를 저장한다.

컬럼:
- [id]: 정수(integer), PK, 자동 증가, not null
- [name]: 문자열(text), not null
- [sort_order]: 정수(integer), not null
- [created_at]: 날짜/시간(datetime), not null, 기본값 현재 시간

관계:
- suggestions 테이블에서 category_id로 연결된다.

### 테이블 3
테이블명: likes  
설명: 학생이 건의사항에 누른 공감 정보를 저장한다.

컬럼:
- [id]: 정수(integer), PK, 자동 증가, not null
- [suggestion_id]: 정수(integer), not null, FK -> suggestions(id)
- [user_name]: 문자열(text), not null
- [created_at]: 날짜/시간(datetime), not null, 기본값 현재 시간

관계:
- 이 테이블의 [suggestion_id]는 suggestions 테이블의 [id]를 가리킨다.

## 5. 화면 설계

### 화면 1
화면 이름: 건의사항 목록 화면  
화면 목적: 학생들이 등록한 건의사항을 한눈에 확인한다.

구성 요소:
- 건의사항 목록
- 카테고리 선택 영역
- 건의사항 작성 버튼
- 로딩/빈 상태/오류 메시지 영역

액션:
- 사용자가 건의사항 목록을 확인한다 -> API: GET /suggestions
- 사용자가 건의사항을 등록한다 -> API: POST /suggestions

### 화면 2
화면 이름: 건의사항 상세 화면  
화면 목적: 하나의 건의사항 내용을 자세히 확인하고 수정 또는 삭제한다.

구성 요소:
- 건의사항 제목 영역
- 건의사항 상세 내용 영역
- 처리 상태 표시 영역
- 공감 수 표시 영역
- 공감 버튼
- 수정 버튼
- 삭제 버튼

액션:
- 사용자가 건의사항 상세 내용을 확인한다 -> API: GET /api/suggestions/:id
- 사용자가 건의사항을 수정한다 -> API: PATCH /api/suggestions/:id
- 사용자가 건의사항을 삭제한다 -> API: DELETE /api/suggestions/:id
- 사용자가 공감 버튼을 누른다 -> API: POST /api/suggestions/:id/likes

## 6. API 명세

### API 1
- 기능 이름: 건의사항 목록 조회
- 다루는 객체: 건의사항
- Method: GET
- Path: /api/suggestions
- 요청 데이터: 없음
- 응답 데이터:
- 
```json
[
  {
    "id": 1,
    "title": "급식 줄이 너무 길어요",
    "content": "점심시간에 줄이 길어서 밥 먹을 시간이 부족합니다.",
    "category": "급식",
    "writer_name": "홍길동",
    "status": "접수",
    "created_at": "2026-06-16 10:00:00",
    "like_count": 3
  }
]
``` 

API 2
기능 이름: 건의사항 등록
다루는 객체: 건의사항
Method: POST
Path: /api/suggestions
요청 데이터:
``` json
{
  "title": "화장실 휴지가 자주 없어요",
  "content": "쉬는 시간에 화장실을 갔는데 휴지가 없는 경우가 많습니다.",
  "category_id": 2,
  "writer_name": "김학생",
  "password": "1234"
}
응답 데이터:
{
  "message": "건의사항이 등록되었습니다.",
  "id": 1
}
``` 

### API 3
- 기능 이름: 건의사항 수정
- 다루는 객체: 건의사항
- Method: PATCH
- Path: /api/suggestions/:id
- 요청 데이터:
```json
{
  "title": "수정할 제목",
  "content": "수정할 내용",
  "category_id": 2,
  "writer_name": "김학생",
  "password": "글 비밀번호 또는 마스터 비밀번호",
  "master_password": "글 비밀번호 또는 마스터 비밀번호",
  "new_password": "새 글 비밀번호"
}
```

### API 4
- 기능 이름: 건의사항 공감 토글
- 다루는 객체: 공감
- Method: POST
- Path: /api/suggestions/:id/likes
- 요청 데이터:
```json
{
  "user_name": "김학생"
}
```
- 응답 데이터:
```json
{
  "message": "공감했습니다.",
  "liked": true,
  "like_count": 1
}
```

##  7주차 구현 우선순위
건의사항 목록 조회 기능 구현
건의사항 등록 기능 구현
건의사항 상세 조회, 수정, 삭제 기능 구현
