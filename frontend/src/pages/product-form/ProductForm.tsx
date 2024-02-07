import { useNavigate } from "react-router-dom";
import { UserItemForm } from "../../components/user-item-form/UserItemForm";

const ProductFrom = () => {
  const navigate = useNavigate();

  return (
    <>
      <UserItemForm />
      <button className="right" onClick={() => navigate("/product-summary")}>
        Summary
      </button>
    </>
  );
};

export default ProductFrom;
