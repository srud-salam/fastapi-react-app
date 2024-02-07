import { useEffect, useRef, useState } from "react";
import styles from "./UserItemList.module.scss";
import useFastAPI from "../../hooks/useFastAPI";
import { useNavigate } from "react-router-dom";

type Item = {
  id: number;
  title: string;
  price: number;
};

export const UserItemList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const fastAPI = useFastAPI();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fastAPI.get("/items/me");
        setItems(response.data);
      } catch (error: any) {
        if (!error?.response) setErrorMessage("No Server Response");
        else if (error?.response?.status === 401) navigate("/");
        else if (error.response?.data?.detail)
          setErrorMessage(error.response?.data?.detail);
        else setErrorMessage(error.message);
        errorRef.current?.focus();
      }
    };

    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.container}>
      {errorMessage && (
        <p ref={errorRef} className="errorMessage" aria-live="assertive">
          {errorMessage}
        </p>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
