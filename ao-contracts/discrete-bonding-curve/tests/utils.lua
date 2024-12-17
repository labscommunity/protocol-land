local utils = {}

function utils.sendMessageToHandler(name, msg)
    for _, v in ipairs(Handlers.list) do
        if v.name == name then
            v.handle(msg)
            return
        end
    end
    error("Handle " .. name .. " not found")
end

return utils
