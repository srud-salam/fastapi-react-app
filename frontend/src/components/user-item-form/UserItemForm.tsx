import React, { useEffect, useRef, useState } from "react";
import useFastAPI from "../../hooks/useFastAPI";

export const UserItemForm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(0);

  const fastAPI = useFastAPI();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  const handleSumbit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await fastAPI.post(`/items/me`, { title, price });

      setSuccessMessage("Successfully added item");
      setErrorMessage("");
      setTitle("");
      setPrice(0);
    } catch (error: any) {
      if (!error?.response) {
        setErrorMessage("No Server Response");
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response?.data?.detail);
      } else if (error.response?.status === 400) {
        setErrorMessage("Missing Title or Price");
      } else {
        setErrorMessage("Failed to add item");
      }
      errorRef.current?.focus();
    }
  };

  useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, [title, price]);

  return (
    <section>
      {errorMessage && (
        <p ref={errorRef} className="errorMessage" aria-live="assertive">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p ref={successRef} className="successMessage" aria-live="assertive">
          {successMessage}
        </p>
      )}
      <h1>Add Item</h1>
      <form onSubmit={handleSumbit}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="price">price</label>
        <input
          type="number"
          id="price"
          name="price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
        <button>Add</button>
      </form>
    </section>
  );
};
