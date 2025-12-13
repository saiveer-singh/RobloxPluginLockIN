-- Generate new codes every 30 seconds if not verified
    task.spawn(function()
        while not isVerified do
            task.wait(CODE_LIFETIME)
            if not isVerified then
                generateNewCode()
            end
        end
    end)
