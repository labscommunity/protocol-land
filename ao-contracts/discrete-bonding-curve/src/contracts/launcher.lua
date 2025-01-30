local launcher = require "src.handlers.launcher.create_curve_bonded_token"

Handlers.add('Initialize-Curve-Bonded-Token', Handlers.utils.hasMatchingTag('Action', 'Initialize-Curve-Bonded-Token'), launcher.initializeBondedToken)
