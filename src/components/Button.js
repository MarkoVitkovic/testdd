const Button = ({ type = 'submit', className, disabled, ...props }) => (
    <button
        disabled={disabled}
        type={type}
        className={`${className} museosans100 inline-flex items-center px-6 py-2 bg-sky-700 border border-transparent rounded-md font-semibold text-xs text-white tracking-widest hover:bg-sky-900 active:bg-sky-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150`}
        {...props}
    />
)

export default Button
