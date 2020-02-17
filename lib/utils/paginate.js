module.exports = ({ page, pageSize }) => {
  //page starts from 1
  const offset = Number(page - 1) * Number(pageSize);
  const limit = Number(pageSize);
  return {
    offset,
    limit,
  };
};