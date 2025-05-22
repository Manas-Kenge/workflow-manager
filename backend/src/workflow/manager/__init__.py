"""Init and utils."""

from zope.i18nmessageid import MessageFactory

import logging


__version__ = "1.0.0a0"

PACKAGE_NAME = "workflow.manager"

_ = MessageFactory(PACKAGE_NAME)

logger = logging.getLogger(PACKAGE_NAME)
