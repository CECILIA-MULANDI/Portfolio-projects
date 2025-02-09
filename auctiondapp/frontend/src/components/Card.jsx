export const Card = ({ title, description, link }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4 text-center">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>
      <a href={link} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
        Learn More
      </a>
    </div>
  );
};
