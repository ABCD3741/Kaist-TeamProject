function notFoundHandler(req, res) {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error.message || "서버 오류가 발생했습니다."
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
