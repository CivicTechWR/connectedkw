"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SkillEntry from "./SkillFilterWithSearch";
import Image from "next/image";

const CreateRequestForm = ({}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    is_known: false,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create volunteer request");
      }

      const { id } = await res.json();
      router.push(`/requests/${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6 my-12">
      {/* Error */}{" "}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">{error}</div>
      )}
      {/* Name */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="name">
          Name
        </label>
        <input
          name="name"
          id="name"
          type="text"
          className="p-2 border-1"
          onChange={handleChange}
          value={formData.name}
        />
      </div>
      {/* Headline */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="email">
          Email
        </label>
        <input
          name="email"
          id="email"
          type="email"
          className=" p-2 border-1"
          placeholder="e.g. connectedkw@civictechwr.org"
          onChange={handleChange}
          value={formData.email}
        />
      </div>
      {/* Is known */}
      <div className="flex flex-col gap-2">
        <label className="text-sm" htmlFor="is_known">
          Do you already know a volunteer that you would like to work with?
        </label>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input
              name="is_known"
              id="is_known_yes"
              type="radio"
              value="true"
              checked={formData.is_known === true}
              onChange={handleChange}
            />
            <label htmlFor="is_known_yes">Yes</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              name="is_known"
              id="is_known_no"
              type="radio"
              value="false"
              checked={formData.is_known === false}
              onChange={handleChange}
            />
            <label htmlFor="is_known_no">No</label>
          </div>
        </div>
      </div>
      {/* Description */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="description">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          className="border-1 p-2"
          onChange={handleChange}
          value={formData.description}
        ></textarea>
      </div>
      {/* Slug - Slug gets created with flow in Directus */}
      {/* Submit */}
      <div className="flex mt-8">
        {!loading ? (
          <input
            className="btn btn-yellow"
            disabled={loading}
            type="submit"
            value="Submit"
            onClick={handleSubmit}
          />
        ) : (
          <Image src="/loading.svg" width={24} height={24} alt="loading" />
        )}
      </div>
    </form>
  );
};

export default CreateRequestForm;
