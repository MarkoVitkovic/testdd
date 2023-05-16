import { Tooltip } from '@mui/material'

const AddButton = ({ type = 'button', className, hasTooltip = false, tooltipTitle = "Placeholder Tooltip Title", tooltipPlacement = "bottom", ...props }) => {
    if(hasTooltip) {
        return (
            <Tooltip title={tooltipTitle} placement={tooltipPlacement}>
                <button
                    type={type}
                    className={` museosans100 inline-flex items-center justify-center px-3 py-3 bg-slate-50 border-0 drop-shadow-xl rounded-full font-semibold text-lg text-black tracking-widest hover:bg-slate-100 active:bg-slate-100 focus:outline-none disabled:opacity-25 transition ease-in-out duration-150 ${className}`}
                    {...props}
                />
            </Tooltip>
        )
    } else {
        return (
            <button
                type={type}
                className={` museosans100 inline-flex items-center justify-center px-3 py-3 bg-slate-50 border-0 drop-shadow-xl rounded-full font-semibold text-lg text-black tracking-widest hover:bg-slate-100 active:bg-slate-100 focus:outline-none disabled:opacity-25 transition ease-in-out duration-150 ${className}`}
                {...props}
            />
        )
    }
}

export default AddButton
