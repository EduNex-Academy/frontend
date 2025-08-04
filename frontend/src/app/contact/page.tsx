export default function ContactPage() {
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white text-blue-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-medium mb-1">Your Name</label>
            <input
              type="text"
              id="name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-lg font-medium mb-1">Your Email</label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-lg font-medium mb-1">Message</label>
            <textarea
              id="message"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your message..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition duration-300 cursor-pointer"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
