import { useNavigate } from "react-router-dom";
import { UserItemSum } from "../../components/user-item-sum/UserItemSum";
import { UserItemList } from "../../components/user-item-list/UserItemList";

const ProductSummary = () => {
  const navigate = useNavigate();

  return (
    <>
      <UserItemSum />
      <UserItemList />
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
};

export default ProductSummary;
