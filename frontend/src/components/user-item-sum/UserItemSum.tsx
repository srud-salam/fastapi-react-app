import { useEffect, useRef, useState } from "react";
import useFastAPI from "../../hooks/useFastAPI";
import { useNavigate } from "react-router-dom";

export const UserItemSum = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const fastAPI = useFastAPI();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fetchTotalCost = async () => {
      try {
        const { data } = await fastAPI.get(`/items/total/me`);
        setTotalPrice(data);
      } catch (error: any) {
        if (!error?.response) setErrorMessage("No Server Response");
        else if (error?.response?.status === 401) navigate("/");
        else if (error.response?.data?.detail)
          setErrorMessage(error.response?.data?.detail);
        else setErrorMessage(error.message);
        errorRef.current?.focus();
      }
    };
    fetchTotalCost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      {errorMessage && (
        <p ref={errorRef} className="errorMessage" aria-live="assertive">
          {errorMessage}
        </p>
      )}
      <h1>Sum of all items: {totalPrice}</h1>
    </section>
  );
};
